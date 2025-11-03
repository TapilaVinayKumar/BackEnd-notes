const express= require("express");
const path=require("path");

const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const app=express();
app.use(express.json())

let db=null;

const dbpath=path.join(__dirname,"database.db");

const initializeDBAndServer=async()=>{
    try{
        db=await open({
            filename:dbpath,
            driver:sqlite3.Database,
        });

        app.listen(3001,()=>{
            console.log("Server Running at http://localhost:3001/")
        })

    }catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
};




app.get("/notes",async(request,response)=>{
    const getNotesQuery=`
    SELECT 
    * 
    FROM notes 
    ORDER BY id;
    `; 
    const notesArray=await db.all(getNotesQuery)
    response.send(notesArray)
});

app.get("/notes/:noteId",async(request,response)=>{
    const {noteId}=request.params;
    const getNoteQuery=`
    SELECT 
    * 
    FROM notes
    WHERE 
        id=${noteId};
    `
    const note=await db.get(getNoteQuery);
    response.send(note);
})


app.post("/notes/",async(request,response)=>{
    const noteDetails=request.body;
    const {title,description,category="Others"}=noteDetails

    const addNoteQuery=`
    INSERT INTO 
        notes(title,description,category)
    VALUES
        (
            '${title}',
            '${description}',
            '${category}'
        );`;

    const dbResponse=await db.run(addNoteQuery)
    const noteId=dbResponse.lastID; 
    response.send({noteId:noteId})
})


app.put("/notes/:noteId/",async(request,response)=>{
    const{noteId}=request.params;
    const noteDetails=request.body;
    const{title,description,category}=noteDetails
    const updatedNoteQuery=`
    UPDATE 
        notes
    SET
        title='${title}',
        description='${description}',
        category='${category}'
    WHERE 
        id=${noteId};`;

await db.run(updatedNoteQuery)
response.send("note Updated Successfully")

})


app.delete("/notes/:noteId/",async(request,response)=>{
    const{noteId}=request.params
    const deleteNoteQuery=`
    DELETE FROM 
        notes 
    WHERE 
        id=${noteId};`;

    await db.run(deleteNoteQuery)
    response.send("Note Deleted Successfully")
})


app.get("/note/",async(request,response)=>{
    const{search_q=""}=request.query;
    const getNotesQuery=`
    SELECT 
    *
    FROM notes 
    WHERE 
        title LIKE '%${search_q}%'
        OR 
        category LIKE '%${search_q}%' 
        ;`;

    const notesArray=await db.all(getNotesQuery)
    response.send(notesArray)


})




initializeDBAndServer()
