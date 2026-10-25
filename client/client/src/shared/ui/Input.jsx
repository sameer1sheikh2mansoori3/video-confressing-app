
import TextField from "@mui/material/TextField";

export default function SharedInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error = false,
  helperText = "",
  placeholder = "",
  required = false,
  fullWidth = true,
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      required={required}
      fullWidth={fullWidth}
      {...props}
    />
  );
}
