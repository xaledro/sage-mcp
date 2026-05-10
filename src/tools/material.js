const material3Tokens = {
  color: {
    primary: {
      name: "Primary",
      value: "#6750A4",
      description: "Primary color for components and actions"
    },
    onPrimary: {
      name: "On Primary",
      value: "#FFFFFF",
      description: "Text/icons on primary surfaces"
    },
    primaryContainer: {
      name: "Primary Container",
      value: "#EADDFF",
      description: "Container for primary elements"
    },
    onPrimaryContainer: {
      name: "On Primary Container",
      value: "#21005D",
      description: "Text/icons on primary containers"
    },
    secondary: {
      name: "Secondary",
      value: "#625B71",
      description: "Secondary color for less prominent elements"
    },
    onSecondary: {
      name: "On Secondary",
      value: "#FFFFFF",
      description: "Text/icons on secondary surfaces"
    },
    secondaryContainer: {
      name: "Secondary Container",
      value: "#E8DEF8",
      description: "Container for secondary elements"
    },
    onSecondaryContainer: {
      name: "On Secondary Container",
      value: "#1D192B",
      description: "Text/icons on secondary containers"
    },
    tertiary: {
      name: "Tertiary",
      value: "#7D5260",
      description: "Tertiary color for accent elements"
    },
    onTertiary: {
      name: "On Tertiary",
      value: "#FFFFFF",
      description: "Text/icons on tertiary surfaces"
    },
    tertiaryContainer: {
      name: "Tertiary Container",
      value: "#FFD8E4",
      description: "Container for tertiary elements"
    },
    onTertiaryContainer: {
      name: "On Tertiary Container",
      value: "#31111D",
      description: "Text/icons on tertiary containers"
    },
    error: {
      name: "Error",
      value: "#B3261E",
      description: "Error color for error states"
    },
    onError: {
      name: "On Error",
      value: "#FFFFFF",
      description: "Text/icons on error surfaces"
    },
    errorContainer: {
      name: "Error Container",
      value: "#F9DEDC",
      description: "Container for error elements"
    },
    onErrorContainer: {
      name: "On Error Container",
      value: "#410E0B",
      description: "Text/icons on error containers"
    },
    surface: {
      name: "Surface",
      value: "#FFFBFE",
      description: "Surface color for backgrounds"
    },
    onSurface: {
      name: "On Surface",
      value: "#1C1B1F",
      description: "Text/icons on surfaces"
    },
    surfaceVariant: {
      name: "Surface Variant",
      value: "#E7E0EC",
      description: "Variant surface color for differentiation"
    },
    onSurfaceVariant: {
      name: "On Surface Variant",
      value: "#49454F",
      description: "Text/icons on surface variants"
    },
    outline: {
      name: "Outline",
      value: "#79747E",
      description: "Outline color for borders and dividers"
    },
    outlineVariant: {
      name: "Outline Variant",
      value: "#CAC4D0",
      description: "Variant outline for subtle borders"
    },
    background: {
      name: "Background",
      value: "#FFFBFE",
      description: "Background color"
    },
    onBackground: {
      name: "On Background",
      value: "#1C1B1F",
      description: "Text/icons on background"
    },
    inverseSurface: {
      name: "Inverse Surface",
      value: "#313033",
      description: "Surface for inverted themes"
    },
    inverseOnSurface: {
      name: "Inverse On Surface",
      value: "#F4EFF4",
      description: "Text/icons on inverse surfaces"
    },
    inversePrimary: {
      name: "Inverse Primary",
      value: "#D0BCFF",
      description: "Primary for inverse surfaces"
    },
    shadow: {
      name: "Shadow",
      value: "#000000",
      description: "Shadow color"
    },
    scrim: {
      name: "Scrim",
      value: "#000000",
      description: "Scrim color for overlays"
    }
  },
  typography: {
    displayLarge: {
      fontFamily: "Roboto",
      fontSize: "57px",
      fontWeight: 400,
      lineHeight: "64px",
      letterSpacing: "-0.25px"
    },
    displayMedium: {
      fontFamily: "Roboto",
      fontSize: "45px",
      fontWeight: 400,
      lineHeight: "52px",
      letterSpacing: "0px"
    },
    displaySmall: {
      fontFamily: "Roboto",
      fontSize: "36px",
      fontWeight: 400,
      lineHeight: "44px",
      letterSpacing: "0px"
    },
    headlineLarge: {
      fontFamily: "Roboto",
      fontSize: "32px",
      fontWeight: 400,
      lineHeight: "40px",
      letterSpacing: "0px"
    },
    headlineMedium: {
      fontFamily: "Roboto",
      fontSize: "28px",
      fontWeight: 400,
      lineHeight: "36px",
      letterSpacing: "0px"
    },
    headlineSmall: {
      fontFamily: "Roboto",
      fontSize: "24px",
      fontWeight: 400,
      lineHeight: "32px",
      letterSpacing: "0px"
    },
    titleLarge: {
      fontFamily: "Roboto",
      fontSize: "22px",
      fontWeight: 400,
      lineHeight: "28px",
      letterSpacing: "0px"
    },
    titleMedium: {
      fontFamily: "Roboto",
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "24px",
      letterSpacing: "0.15px"
    },
    titleSmall: {
      fontFamily: "Roboto",
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "20px",
      letterSpacing: "0.1px"
    },
    bodyLarge: {
      fontFamily: "Roboto",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0.5px"
    },
    bodyMedium: {
      fontFamily: "Roboto",
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      letterSpacing: "0.25px"
    },
    bodySmall: {
      fontFamily: "Roboto",
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "16px",
      letterSpacing: "0.4px"
    },
    labelLarge: {
      fontFamily: "Roboto",
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "20px",
      letterSpacing: "0.1px"
    },
    labelMedium: {
      fontFamily: "Roboto",
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: "16px",
      letterSpacing: "0.5px"
    },
    labelSmall: {
      fontFamily: "Roboto",
      fontSize: "11px",
      fontWeight: 500,
      lineHeight: "16px",
      letterSpacing: "0.5px"
    }
  },
  spacing: {
    none: 0,
    extraSmall: "4px",
    small: "8px",
    medium: "16px",
    large: "24px",
    extraLarge: "32px",
    extraExtraLarge: "48px"
  },
  borderRadius: {
    none: "0px",
    extraSmall: "4px",
    small: "8px",
    medium: "12px",
    large: "16px",
    extraLarge: "28px",
    full: "50%"
  },
  elevation: {
    level0: {
      name: "Level 0",
      shadow: "none"
    },
    level1: {
      name: "Level 1",
      shadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)"
    },
    level2: {
      name: "Level 2",
      shadow: "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)"
    },
    level3: {
      name: "Level 3",
      shadow: "0px 4px 8px 3px rgba(0, 0, 0, 0.3), 0px 1px 14px 2px rgba(0, 0, 0, 0.15)"
    },
    level4: {
      name: "Level 4",
      shadow: "0px 6px 10px 4px rgba(0, 0, 0, 0.3), 0px 1px 18px 1px rgba(0, 0, 0, 0.15)"
    },
    level5: {
      name: "Level 5",
      shadow: "0px 8px 12px 6px rgba(0, 0, 0, 0.3), 0px 1px 22px 2px rgba(0, 0, 0, 0.15)"
    }
  }
};

function getMaterialTokens(version) {
  return {
    version: version || "1.0.0",
    standard: "Material Design 3",
    tokens: material3Tokens,
    generatedAt: new Date().toISOString(),
    note: "Core tokens. Connect @base/design-system for extended theme integration."
  };
}

function getMaterialColorTokens() {
  return {
    category: "color",
    tokens: material3Tokens.color
  };
}

function getMaterialTypographyTokens() {
  return {
    category: "typography",
    tokens: material3Tokens.typography
  };
}

function getMaterialSpacingTokens() {
  return {
    category: "spacing",
    tokens: material3Tokens.spacing
  };
}

export {
  getMaterialTokens,
  getMaterialColorTokens,
  getMaterialTypographyTokens,
  getMaterialSpacingTokens,
  material3Tokens
};