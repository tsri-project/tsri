import { redirect } from "@remix-run/react";

export const clientLoader = async () => {
  return redirect("/dashboard");
};

export default function IndexRoute() {
  return null;
}

