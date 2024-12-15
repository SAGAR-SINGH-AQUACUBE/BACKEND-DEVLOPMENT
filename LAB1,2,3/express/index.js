const express=require("express");
const app=express();
const port=3000;
app.listen(port,()=>{
  console.log(`we  are listening at ${port}`);
});

// app.use((req,res)=>{
//   console.log("request recieved");
//   // res.send("this is basic response");
//   // res.send({name:'sagar',age:20})
//   res.send("<h1>hi how are you</h1> <ul><li>apple</li> <li>mango</li></ul>");
// });





// *******************IMPLEMENTATION OF GET AND POST*************************
// app.get('/',(req,res)=>{
//   res.send("root path");
// });
// app.get('/ab',(req,res)=>{
//   res.send("root path:1");
// });
// app.get('/ac',(req,res)=>{
//   res.send("root path:2");
// });
// app.get('*',(req,res)=>{
//   res.send("root path:NO");
// });

// app.post('/',(req,res)=>{
//   res.send("psoststststst");
// });


// ****************PATH PARAMETER******************************
// app.get('/:username/:id',(req,res)=>{
//   console.log(req.params);
//   res.send("root path:1");
// });


//****************QUERY STRINGS*************************
app.get('/search',(req,res)=>{
  console.log(req.query);
  res.send("root path:2");
});
