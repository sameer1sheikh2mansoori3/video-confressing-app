import Button from "@mui/material/Button";

export default function SharedButton({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  type = "button",
  disabled = false,
  onClick,
  fullWidth = false,
  text = "",
}) {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth={fullWidth}

    >
     {text} {children}
    </Button>
  );
}
