#!/usr/bin/env python3
"""
Convert procedural low-poly GLB furniture models to Apple ARKit & RealityKit compliant USDZ archives.
Uses standard Pixar OpenUSD tooling (usdzip, usdchecker).
"""
import json
import struct
import os
import subprocess
import sys

def convert_glb_to_usdz(glb_path: str, usdz_path: str, prim_name: str):
    print(f"Converting {glb_path} -> {usdz_path} (Prim: {prim_name})...")
    with open(glb_path, 'rb') as f:
        magic, ver, length = struct.unpack('<4sII', f.read(12))
        chunk_len, chunk_type = struct.unpack('<I4s', f.read(8))
        json_bytes = f.read(chunk_len)
        gltf = json.loads(json_bytes.decode('utf-8'))
        
        bin_len, bin_type = struct.unpack('<I4s', f.read(8))
        bin_data = f.read(bin_len)
    
    buffer_views = gltf['bufferViews']
    accessors = gltf['accessors']
    
    def get_data(acc_idx):
        acc = accessors[acc_idx]
        bv = buffer_views[acc['bufferView']]
        offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        count = acc['count']
        acc_type = acc['type']
        comp_type = acc['componentType']
        
        if acc_type == 'VEC3' and comp_type == 5126:
            fmt = f'<{count * 3}f'
            raw = struct.unpack_from(fmt, bin_data, offset)
            return [raw[i:i+3] for i in range(0, len(raw), 3)]
        elif acc_type == 'VEC4' and comp_type == 5126:
            fmt = f'<{count * 4}f'
            raw = struct.unpack_from(fmt, bin_data, offset)
            return [raw[i:i+4] for i in range(0, len(raw), 4)]
        elif acc_type == 'SCALAR' and comp_type == 5123:
            fmt = f'<{count}H'
            return list(struct.unpack_from(fmt, bin_data, offset))
        else:
            raise ValueError(f'Unsupported: {acc_type}, {comp_type}')

    mesh = gltf['meshes'][0]
    prim = mesh['primitives'][0]
    pos_idx = prim['attributes']['POSITION']
    norm_idx = prim['attributes']['NORMAL']
    col_idx = prim['attributes'].get('COLOR_0')
    ind_idx = prim['indices']
    
    positions = get_data(pos_idx)
    normals = get_data(norm_idx)
    colors = get_data(col_idx) if col_idx is not None else []
    indices = get_data(ind_idx)
    
    min_x = min(p[0] for p in positions)
    min_y = min(p[1] for p in positions)
    min_z = min(p[2] for p in positions)
    max_x = max(p[0] for p in positions)
    max_y = max(p[1] for p in positions)
    max_z = max(p[2] for p in positions)
    
    num_triangles = len(indices) // 3
    face_counts = [3] * num_triangles
    
    points_str = ', '.join(f'({p[0]:.4f}, {p[1]:.4f}, {p[2]:.4f})' for p in positions)
    normals_str = ', '.join(f'({n[0]:.4f}, {n[1]:.4f}, {n[2]:.4f})' for n in normals)
    indices_str = ', '.join(str(i) for i in indices)
    face_counts_str = ', '.join(str(c) for c in face_counts)
    
    if colors:
        colors_str = ', '.join(f'({c[0]:.3f}, {c[1]:.3f}, {c[2]:.3f})' for c in colors)
        color_def = f'''
        color3f[] primvars:displayColor = [{colors_str}] (
            interpolation = "vertex"
        )'''
    else:
        color_def = '''
        color3f[] primvars:displayColor = [(0.7, 0.7, 0.7)] (
            interpolation = "constant"
        )'''

    usda_text = f'''#usda 1.0
(
    defaultPrim = "{prim_name}"
    metersPerUnit = 1.0
    upAxis = "Y"
)

def Xform "{prim_name}" (
    kind = "component"
)
{{
    def Scope "Materials"
    {{
        def Material "DefaultMaterial"
        {{
            token outputs:surface.connect = </{prim_name}/Materials/DefaultMaterial/PBRShader.outputs:surface>

            def Shader "PBRShader"
            {{
                uniform token info:id = "UsdPreviewSurface"
                color3f inputs:diffuseColor.connect = </{prim_name}/Materials/DefaultMaterial/PrimvarReader.outputs:rgb>
                float inputs:roughness = 0.55
                float inputs:metallic = 0.05
                token outputs:surface
            }}

            def Shader "PrimvarReader"
            {{
                uniform token info:id = "UsdPrimvarReader_float3"
                string inputs:varname = "displayColor"
                float3 outputs:rgb
            }}
        }}
    }}

    def Mesh "Geom" (
        prepend apiSchemas = ["MaterialBindingAPI"]
    )
    {{
        rel material:binding = </{prim_name}/Materials/DefaultMaterial>
        float3[] extent = [({min_x:.4f}, {min_y:.4f}, {min_z:.4f}), ({max_x:.4f}, {max_y:.4f}, {max_z:.4f})]
        int[] faceVertexCounts = [{face_counts_str}]
        int[] faceVertexIndices = [{indices_str}]
        point3f[] points = [{points_str}]
        normal3f[] normals = [{normals_str}] (
            interpolation = "vertex"
        ){color_def}
    }}
}}
'''
    temp_usda = usdz_path.replace('.usdz', '.temp.usda')
    with open(temp_usda, 'w') as out:
        out.write(usda_text)
    
    try:
        subprocess.run(['usdzip', usdz_path, temp_usda], check=True, stdout=subprocess.DEVNULL)
    finally:
        if os.path.exists(temp_usda):
            os.remove(temp_usda)
    
    check = subprocess.run(['usdchecker', '--arkit', usdz_path], capture_output=True, text=True)
    if 'Success!' in check.stdout:
        print(f"  ✓ {usdz_path} generated ({os.path.getsize(usdz_path)} bytes) - ARKit validation PASSED")
    else:
        print(f"  ✗ Validation warning/failure: {check.stdout}\n{check.stderr}")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, 'public', 'models')
    
    convert_glb_to_usdz(
        os.path.join(models_dir, 'sofa_modern.glb'),
        os.path.join(models_dir, 'sofa_modern.usdz'),
        'Sofa'
    )
    convert_glb_to_usdz(
        os.path.join(models_dir, 'chair_nordic.glb'),
        os.path.join(models_dir, 'chair_nordic.usdz'),
        'Chair'
    )
    convert_glb_to_usdz(
        os.path.join(models_dir, 'table_coffee.glb'),
        os.path.join(models_dir, 'table_coffee.usdz'),
        'Table'
    )
