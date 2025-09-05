export const toUserDTO = (user) => ({
  id: String(user._id),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  age: user.age,
  role: user.role,
  cart: user.cart
});
