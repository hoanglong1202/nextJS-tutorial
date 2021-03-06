import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { secret } from "../../../api/secret";
import cookie from "cookie";

export default async function getAllPeople(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await open({
    filename: "./mydb2.sqlite",
    driver: sqlite3.Database,
  });

  if (req.method === "POST") {
    const person = await db.get("SELECT * FROM Person where email = ?", [
      req.body.email,
    ]);
    compare(req.body.password, person.password, async function (err, result) {
      // result == true
      if (!err && result) {
        const claim = { name: person.name, email: person.email, isValid: true };
        const token = sign(claim, secret, { expiresIn: "1h" });

        res.setHeader(
          "Set-Cookie",
          cookie.serialize("auth", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 3600,
            path: "/",
          })
        );

        res.json({ message: "Welcome back" });
      } else {
        res.json("Something wrong " + err);
      }
    });
  } else {
    res.json("We only accept POST");
  }
}
