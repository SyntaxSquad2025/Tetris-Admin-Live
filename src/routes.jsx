import { Suspense, Fragment, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Loader from "./components/Loader/Loader";
import AdminLayout from "./layouts/AdminLayout";

import { BASE_URL } from "./config/constant";

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>
                  {route.routes ? (
                    renderRoutes(route.routes)
                  ) : (
                    <Element props={true} />
                  )}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    exact: "true",
    path: "/login",
    element: lazy(() => import("./views/auth/signin/SignIn1")),
  },
  {
    exact: "true",
    path: "/auth/signin-1",
    element: lazy(() => import("./views/auth/signin/SignIn1")),
  },
  {
    exact: "true",
    path: "/auth/forgotpassword",
    element: lazy(() => import("./views/auth/signin/forgotpassword")),
  },
  {
    exact: "true",
    path: "/auth/signup-1",
    element: lazy(() => import("./views/auth/signup/SignUp1")),
  },
  {
    path: "*",
    layout: AdminLayout,
    routes: [
      {
        exact: "true",
        path: "/dashboard",
        element: lazy(() => import("./views/dashboard")),
      },
      // {
      //   exact: "true",
      //   path: "/leaderboard",
      //   element: lazy(() => import("./views/ui-elements/basic/leaderboard")),
      // },
      {
        exact: "true",
        path: "/usermanagement",
        element: lazy(() => import("./views/ui-elements/basic/usermanagement")),
      },
      {
        exact: "true",
        path: "/tasks",
        element: lazy(() => import("./views/ui-elements/basic/tasks")),
      },
      {
        exact: "true",
        path: "/telegramads",
        element: lazy(() => import("./views/ui-elements/basic/telegramads")),
      },
      {
        exact: "true",
        path: "/gamehistory",
        element: lazy(() => import("./views/ui-elements/basic/gamehistory")),
      },
      {
        exact: "true",
        path: "/user-game-details/:username",
        element: lazy(
          () => import("./views/ui-elements/basic/usergamedetails")
        ),
      },
      {
        exact: "true",
        path: "/allwithdrawals",
        element: lazy(() => import("./views/ui-elements/basic/allwithdrawals")),
      },
      {
        exact: "true",
        path: "/pendingwithdrawals",
        element: lazy(
          () => import("./views/ui-elements/basic/pendingwithdrawals")
        ),
      },
      {
        exact: "true",
        path: "/approvedwithdrawals",
        element: lazy(
          () => import("./views/ui-elements/basic/approvedwithdrawals")
        ),
      },
      {
        exact: "true",
        path: "/rejectedwithdrawals",
        element: lazy(
          () => import("./views/ui-elements/basic/rejectedwithdrawals")
        ),
      },
      {
        exact: "true",
        path: "/transferwithdrawals",
        element: lazy(
          () => import("./views/ui-elements/basic/transferwithdrawals")
        ),
      },
      {
        exact: "true",
        path: "/withdrawalmethods",
        element: lazy(
          () => import("./views/ui-elements/basic/withdrawalmethods")
        ),
      },
      {
        exact: "true",
        path: "/withdrawallimits",
        element: lazy(
          () => import("./views/ui-elements/basic/withdrawallimits")
        ),
      },
      {
        exact: "true",
        path: "/addboosters",
        element: lazy(() => import("./views/ui-elements/basic/addboosters")),
      },
      {
        exact: "true",
        path: "/boostertransactions",
        element: lazy(
          () => import("./views/ui-elements/basic/boostertransactions")
        ),
      },
      {
        exact: "true",
        path: "/boostersettings",
        element: lazy(
          () => import("./views/ui-elements/basic/boostersettings")
        ),
      },
      {
        exact: "true",
        path: "/level&multiplier",
        element: lazy(
          () => import("./views/ui-elements/basic/level&multiplier")
        ),
      },
      {
        exact: "true",
        path: "/dailyrewards",
        element: lazy(() => import("./views/tables/dailyrewards")),
      },
      {
        exact: "true",
        path: "/refferalamount",
        element: lazy(() => import("./views/tables/refferalamount")),
      },
      {
        exact: "true",
        path: "/ticketmanagement",
        element: lazy(
          () => import("./views/ui-elements/basic/ticketmanagement")
        ),
      },
      {
        exact: "true",
        path: "/announcement",
        element: lazy(() => import("./views/ui-elements/basic/announcement")),
      },
      {
        exact: "true",
        path: "/logout",
        element: lazy(() => import("./views/tables/logout")),
      },
      // {
      //   exact: "true",
      //   path: "/sample-page",
      //   element: lazy(() => import("./views/extra/SamplePage")),
      // },
      {
        path: "*",
        exact: "true",
        element: () => <Navigate to={BASE_URL} />,
      },
      {
        exact: "true",
        path: "/profile",
        element: lazy(() => import("./views/extra/profile")),
      },
    ],
  },
];

export default routes;
