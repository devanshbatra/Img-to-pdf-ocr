//Importing our libraries
const express = require("express");
app = express();
const path = require('path');
const fs = require("fs");//For file-handling
const multer = require("multer");// help to upload our files
const {TesseractWorker} = require('tesseract.js');
const { dirname } = require("path");
const worker = new TesseractWorker;

// const Tesseract = require('tesseract.js');
// const worker = Tesseract.createWorker({
//     logger: m => console.log(m)
// });

//Using static
app.use("/static", express.static("localfolder"));
// setting View engine(ejs)
app.set("view engine", "ejs");
// app.set('views',path.join(__dirname, 'views'));



//Saving the uploaded file to the Storage in the specified folder
const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        callback(null, "./uploads");
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname)
    }
});
const upload = multer({storage: storage}).single("Myfile"); //Whenever we call the function upload its gonna ask for multer;s storage attr. and then call the function storage(above)

//Express routs
app.get("/", (req, res)=>{
    res.render('index');
} );

app.post('/upload', (req, res)=>{
    upload(req, res, err => {
        fs.readFile(`uploads/${req.file.originalname}`, (err, data)=>{
            if(err) return console.log(`your error is: ${err}`);


            worker
            .recognize(data, "eng", { tessjs_create_pdf: "1" })
            .progress(progress=>{
                console.log(progress);
            })
            .then(result =>{
                // res.send(result.text);
                res.redirect("/download");
            })
            .finally(()=>worker.terminate());
        });
    });
});


app.get("/download", (req, res)=>{
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})
//starting server
port= 80 || process.env.port;
app.listen(port, ()=>{
    console.log(`Server running at port: ${port}`);
})

