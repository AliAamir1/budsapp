import React from "react";
import { Dropdown } from "react-native-element-dropdown";

interface DropdownOption {
  label: string;
  value: string;
}

interface ElementDropdownProps {
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  items: DropdownOption[];
  size?: "sm" | "md" | "lg" | "xl";
  zIndex?: number;
}

export const ElementDropdown: React.FC<ElementDropdownProps> = ({
  placeholder = "Select an option",
  value,
  onValueChange,
  items,
  size = "xl",
  zIndex = 9999,
}) => {
  const getHeight = () => {
    switch (size) {
      case "sm":
        return 40;
      case "md":
        return 48;
      case "lg":
        return 56;
      case "xl":
        return 64;
      default:
        return 64;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
      case "xl":
        return 20;
      default:
        return 20;
    }
  };

  return (
    <Dropdown
      style={{
        height: getHeight(),
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
      }}
      placeholderStyle={{
        fontSize: getTextSize(),
        color: "#9ca3af",
      }}
      inputSearchStyle={{
        fontSize: getTextSize(),
        color: "#1f2937",
      }}
      data={items}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder="Search..."
      value={value}
      onChange={(item) => {
        onValueChange(item.value);
      }}
      renderLeftIcon={() => null}
      renderRightIcon={() => null}
      activeColor="#f3f4f6"
      containerStyle={{
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
      itemContainerStyle={{
        backgroundColor: "#ffffff",
      }}
      itemTextStyle={{
        fontSize: getTextSize(),
        color: "#1f2937",
        paddingVertical: 8,
      }}
      selectedTextStyle={{
        fontSize: getTextSize(),
        color: "#1f2937",
        fontWeight: "600",
        paddingVertical: 8,
      }}
    />
  );
}; 