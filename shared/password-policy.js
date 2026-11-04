export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 20;
export const PASSWORD_MESSAGE = "Password must be 6–20 characters";
export function validPassword(value) {
  return (
    typeof value === "string" &&
    value.length >= PASSWORD_MIN &&
    value.length <= PASSWORD_MAX
  );
}
