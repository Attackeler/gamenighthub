const fs=require("fs");
const files=fs.readdirSync(".").filter(f=>f.startsWith("chunk-")&&f.endsWith(".js"));
const hits=new Set();
for (const file of files){
  const data=fs.readFileSync(file,'utf8');
  const regex=/graphql[^\"'`]+/g;
  let match;
  while((match=regex.exec(data))){
    hits.add(match[0]);
    if(hits.size>20) break;
  }
}
console.log([...hits]);
