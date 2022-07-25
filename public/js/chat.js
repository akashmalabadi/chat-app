
//const messageForm=document.querySelector("#message-form")
//const messageFormButton=messageForm.querySelector("button")
//const messageFormInput=messageForm.querySelector("input")

//templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationMessageTemplate=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

//options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix : true})  //location.serach takes browser query values


const socket=io()
socket.on("message",(message)=>{
        console.log(message)
        const html=Mustache.render(messageTemplate,{
            username:message.username,
            message:message.text,
            createdAt:moment(message.createdAt).format("h:mm a") 
        })
        document.querySelector("#messages").insertAdjacentHTML("beforeend",html)
})

socket.on("locationMessage",(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    document.querySelector("#messages").insertAdjacentHTML("beforeend",html)
    
})

socket.on("roomData",({room,users})=>{
    console.log(room)
    console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room,
        users,
    })
    document.querySelector("#sidebar").innerHTML=html
})

// socket.on('locationMessage', (url) => {
//     console.log(url)
//     const html = Mustache.render(locationMessageTemplate, {
//         url
//     })
//     document.querySelector("#messages").insertAdjacentHTML('beforeend', html)
// })



document.querySelector("#message-form").addEventListener("submit",(e)=>{
    e.preventDefault()

    document.querySelector("#but").setAttribute("disabled","disabled") //to set default null 

    //const message=document.querySelector("input").value
    const message=e.target.elements.message123.value
    socket.emit("sendMessage",message,(error)=>{
        document.querySelector("#but").removeAttribute("disabled") //
        document.querySelector("#mes").value="" //erase afer submiting data and set to null
        document.querySelector("#mes").focus()

        if(error){
            return console.log(error)
        }

        console.log("the message was delivered")
    })

})

document.querySelector("#send-location").addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("deolocation is not supported by your browser")
    }

    document.querySelector("#send-location").setAttribute("disabled","disabled") //to set default null

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            document.querySelector("#send-location").removeAttribute("disabled") 
            console.log("location shared")
        })
    })

})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href("/")
    }
})





// socket.on("countUpdated",(count)=>{
//     console.log("the count has been updated" ,count)
// })

// document.querySelector("#increment").addEventListener("click",()=>{
//     console.log("clicked")
//     socket.emit("increment")
// })



