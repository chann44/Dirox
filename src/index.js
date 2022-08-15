#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { resolve } = require("path");
const { readdir } = require("fs").promises;
const cwdpath = path.parse(process.cwd());
const srcdir = cwdpath.dir;
let rootdir = ".";
let public = "./src/public";

if (fs.existsSync(`${rootdir}/package.json`)) {
  console.log(true);
  if (fs.existsSync(public)) {
    public = path.resolve(public);
  } else if (fs.existsSync("./public")) {
    public = "./public";
  } else {
    console.log("no public");
  }

  async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else {
        yield res;
      }
    }
  }

  (async () => {
    const filePath = {};
    const arr = [];
    console.log(public);
    public = public == "./public" ? path.basename(public) : public;
    try {
      for await (const f of getFiles(public)) {
        const file = path.parse(f);
        if (path.basename(file.dir) == "public") {
          filePath[file.name.replaceAll("-", "")] = `/${file.base}`;
        } else {
          filePath[file.name.replace("-", "")] = `/${path.basename(file.dir)}/${
            file.base
          }`;
        }
      }

      console.log(filePath);
      console.log(arr);

      fs.writeFileSync(
        `${rootdir}/public.json`,
        JSON.stringify(filePath, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.log(e);
    }
  })();
} else {
  console.log("run this command from the root of your project");
}
