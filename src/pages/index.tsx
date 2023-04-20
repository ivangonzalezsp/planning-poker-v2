import type { NextPage } from "next";
import Home from "../components/Home";
import { Analytics } from "@vercel/analytics/react";

const HomePage: NextPage = () => {
  return (
    <>
      <Home />
      <Analytics />
    </>
  );
};

export default HomePage;
