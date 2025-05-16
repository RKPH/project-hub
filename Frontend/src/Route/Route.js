import NoheaderLayout from "../Layout/NoheaderLayout";
import NotFound from "../Pages/404";
import Homepage from "../Pages/Homepage";
import LoginPage from "../Pages/User/Login.jsx";
import DetailProduct from "../Pages/Product/DetailProduct.jsx";
import UserPage from "../Pages/User/User/UserPage.jsx";
import Register from "../Pages/User/Register.jsx";
import Cart from "../Pages/User/Cart.jsx";
import OrderList from "../Pages/User/User/Order.jsx";
import Checkout from "../Pages/User/Checkout.jsx";
import OrderTracking from "../Pages/Product/OrderTracking.jsx";
import paymentSuccessfully from "../Pages/Product/PaymentSuccessfully.jsx";
import productTypes from "../Pages/Product/productTypes.jsx";
import VerifyPage from "../Pages/User/Verify.jsx";
import forgotpass from "../Pages/User/forgotpass.jsx";
import ResetPassword from "../Pages/User/Resetpass.jsx";
import productCategories from "../Pages/Product/productCategories.jsx";
import {Search} from "@mui/icons-material";
import SeachFullPage from "../Pages/Product/SeachFullPage.jsx";
import AboutUs from "../Pages/AboutUs.jsx";
import ContactUs from "../Pages/CotactUs.jsx";


Homepage;

export const publicRoutes = [
  {
    path: "/",
    component: Homepage,
  },
  {
    path: "/Login",
    component: LoginPage,
    layout: NoheaderLayout,
  },
  {
    path: "/Register",
    component: Register,
    layout: NoheaderLayout,
  },
  {
    path: "/verify",
    component: VerifyPage,
    layout: NoheaderLayout,
  },
  {
    path: "/forgotpassword",
    component: forgotpass,
    layout: NoheaderLayout,
  },
  {
    path: "/reset-password/:token",
    component: ResetPassword,
    layout: NoheaderLayout,
  },
  {
    path: "/about",
    component: AboutUs,
  },
  {
    path: "/contact",
    component: ContactUs,
  },
  {
    path: "/Me",
    component: UserPage,
  },
  {
    path: "/products/type/:type",
    component:productTypes
  },
  {
    path: "/products/category/:category",
    component:productCategories
  },
  {
    path: "/product/:id",
    component: DetailProduct,
  },
  {
    path: "/products/search",
    component: SeachFullPage,
  },
  {
    path: "/cart",
    component: Cart,
  },
  {
    path: "/orders",
    component: OrderList,
  },
  {
    path: "/checkout",
    component: Checkout
  },
  {
    path: "/checkout/result/:orderId",
    component: paymentSuccessfully
  },
  {
    path: "/Order/:orderId",
    component: OrderTracking,
  },
  {
    path: "*",
    component: NotFound,
    layout: NoheaderLayout,
  },
];
