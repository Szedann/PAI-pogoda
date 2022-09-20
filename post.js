let loc = ""
const getWeather = async (loc)=>{
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${loc}?unitGroup=metric&key=${weatherApiKey}&contentType=json&lang=pl&iconSet=icons2`
    return await (await fetch(url)).json()
}
let selectedDay = 0

const updateTime = () =>{
    const now = new Date()
    document.getElementById("hour").innerText = now.toLocaleTimeString("pl", {timeStyle: "short"})
    document.getElementById("date").innerText = now.toLocaleDateString("pl", {dateStyle: "full"})
}

locChangeMap.on("click", e=>{
    document.getElementById("location").value = `${e.lngLat.lat}, ${e.lngLat.lng}`
})

const updateLoc = ()=>{
    document.getElementById("setCityModalBG").style.display = "flex"
    return new Promise(resolve=>{
        document.getElementById("saveLoc").onclick = ()=>{
            document.getElementById("setCityModalBG").style.display = "none"
            const place = document.getElementById("location").value
            window.localStorage.setItem("location", place)
            loc = place
            updateWeather()
            resolve(place)
        }
    })
}

const getLoc = async ()=>{
    let place = window.localStorage.getItem("location")
    if(!place) place = await updateLoc()
    loc = place
    return place
}

updateTime()
setInterval(updateTime, 1000)

const updateWeather = async () => {
    const weather = await getWeather(loc)
    console.log(weather)
    // document.getElementById("current").style.backgroundImage = `url("./conditionImages/${weather.currentConditions.icon}.jpg")`
    document.getElementById("currentTemp").innerText = `${Math.round(weather.currentConditions.temp)}°C`
    document.getElementById("currentConditions").innerText = weather.currentConditions.conditions
    document.getElementById("currentHumidity").innerText = `${Math.round(weather.currentConditions.humidity)}% 💧`
    document.getElementById("currentWindSpeed").innerText = `${Math.round(weather.currentConditions.windspeed)}km/h 🍃`
    document.getElementById("currentUVIndex").innerText = `${weather.currentConditions.uvindex} ☀️`
    const coords = [weather.latitude, weather.longitude]
    let currentMap = new mapboxgl.Map({
        container: 'currentMap',
        style: 'mapbox://styles/szedann/cl88x9b2z004w15p1w6dn91t7',
        center: [coords[1]+.3, coords[0]],
        zoom: 8,
        interactive: false
    });



    const forecastSlider = document.getElementById("forecastSlider")
    document.getElementById("navButtons").innerHTML = ""
    forecastSlider.innerHTML = ""

    for(const index in weather.days){
        const day = weather.days[index]
        const t = new Date(day.datetime)
        const div = document.createElement("div")
        div.className = "forecastDay"
        div.style.backgroundImage = `url("./conditionImages/${day.icon}.jpg")`
        div.innerHTML = `
        <div class="dayContent">
            <div class="forecastDate">${t.toLocaleDateString("pl",{dateStyle: "full", timeZone: "GMT+0"})}</div>
            <div class="forecastTemps">
                <h1>${Math.round(day.temp)}°C</h1>
                <div>${Math.round(day.tempmax)}/${Math.round(day.tempmin)}°C</div>
            </div>
            <div>${day.conditions}</div>
            <div>${Math.round(day.humidity)}% 💧</div>
            <div>${Math.round(day.windspeed)}km/h 🍃</div>
            <div>${Math.round(day.uvindex)} ☀️</div>
            <ul class="hours">
                ${day.hours.map((hour, index)=>{
                    if(index%2==0) return
                    return `
                    <div class="hour">
                        ${hour.datetime.slice(0,5)}
                        <img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Monochrome/${hour.icon}.png">
                        <div>${Math.round(hour.temp)}°C</div>
                    </div>`
                }).join(" ")}
            </ul>
        </div>
        `
        forecastSlider.appendChild(div)
        const radio = document.createElement("input")
        radio.type = "radio"
        radio.value = index
        radio.name = "selectedDay"
        radio.onclick = (e) => {
            e.preventDefault()
            selectDay(index)
        }
        document.getElementById("navButtons").appendChild(radio)
    }
    
    selectDay(0)
    document.getElementById("navButtons").children.item(0).checked = true
}

const selectDay = (d)=>{
    let day = parseInt(d)
    const l = document.getElementById("forecastSlider").children.length
    if(day>=l) day = 0
    if(day<0) day = l-1
    document.getElementById("forecastSlider").scrollTo({left: document.getElementById("forecastSlider").children.item(0).clientWidth*day, behavior: 'smooth'})
}

const nextDay = () => selectDay(selectedDay+1)
    
const prevDay = () => selectDay(selectedDay-1)


let touchstartX = 0
let touchendX = 0
const minTravel = 50
const element = document.querySelector(".navButtons")
    
const checkDirection = () => {
  if (touchendX-minTravel > touchstartX) prevDay()
  if (touchendX+minTravel < touchstartX) nextDay()
}

element.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
})

element.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  checkDirection()
})

getLoc().then(()=>{
    updateWeather()
    setInterval(updateWeather, 10 * 60 * 1000)
})

document.getElementById("forecastSlider").onscroll = (e)=>{
    const scroll = e.target.scrollLeft
    const elementWidth = document.getElementById("forecastSlider").children.item(0).clientWidth
    const element = Math.round(scroll/elementWidth)
    selectedDay = element
    document.getElementById("navButtons").children.item(element).checked = true
}