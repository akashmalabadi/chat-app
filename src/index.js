
const path=require("path")
const http=require("http")
const express=require("express")
const socketio=require("socket.io")
const Filter=require("bad-words")
const {generateMessage,generateLocationMessage}=require("./utils/message")
const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users")

const app=express()
const server=http.createServer(app)
const io=socketio(server)  //creating socketio server

const port=process.env.PORT || 3000

const publicDirectoryPath=path.join(__dirname,"../public")

app.use(express.static(publicDirectoryPath))

count=0
//server[emit] -> client[receive] => countUpdated
//client[emit] -> server[receive] =>increment

//server[emit] -> client[receive] => acknowlwgment -> server
//client[emit] -> server[receive] => acknowlwgment -> client 

io.on("connection",(socket)=>{ //this socket contains info of new connections
    console.log("new connection created")
    // socket.emit("message",generateMessage("welcome")) //send to only own connected client

    // socket.broadcast.emit("message",generateMessage("new user has joined")) //send to all other connected cleint except own

    socket.on("join",({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})

        if(error){
            callback(error)
        }

        socket.join(user.room)
        socket.emit("message",generateMessage("admin","welcome")) //send to only own connected client
        // socket.broadcast.emit("message",generateMessage("new user has joined")) //send to all other connected cleint except own
        socket.broadcast.to(user.room).emit("message",generateMessage("admin",`${user.username} has joined!`)) //send to all other connected cleint of same room only except own
        
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)

        })

        callback()
    })

    socket.on("sendMessage",(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback("profanity is not allowed")
        }

        io.to(user.room).emit("message",generateMessage(user.username,message))//send to all connected clients  
        callback()     
    })

    socket.on("sendLocation",(coords,callback)=>{
        const user=getUser(socket.id)
        //io.emit("message",coords)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })

    socket.on("disconnect",()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message",generateMessage("admin",`${user.username} has left! `)) //send message to all clients when a one client disconnect 
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUsersInRoom(user.room)
    
            })
        }
        
    })

    


    
})
// io.on("connection",(socket)=>{ //this socket contains info of new connections
//     console.log("new connection created")
//     socket.emit("countUpdated",count)

//     socket.on("increment",()=>{
//         count++
//         //socket.emit("countUpdated",count)
//         io.emit("countUpdated",count)
//     })
    
// })

server.listen(port,()=>{
    console.log("app is running on port "+port)
})

