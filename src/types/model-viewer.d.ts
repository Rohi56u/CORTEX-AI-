import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "ios-src"?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-placement"?: string;
          "ar-scale"?: string;
          "camera-controls"?: boolean;
          "camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          "auto-rotate"?: boolean | string;
          "auto-rotate-delay"?: string | number;
          "rotation-per-second"?: string;
          "touch-action"?: string;
          "interaction-prompt"?: string;
          "environment-image"?: string;
          "shadow-intensity"?: string | number;
          "shadow-softness"?: string | number;
          exposure?: string | number;
          alt?: string;
          poster?: string;
          loading?: string;
          reveal?: string;
          orientation?: string;
          scale?: string;
        },
        HTMLElement
      >;
    }
  }
}
