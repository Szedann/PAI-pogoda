const weatherApiKey = "DQ2FNSBDB8VGKVR2M8FG9Q8SU"

const loc = "Warsaw"
const getWeather = async (loc)=>{
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${loc}?unitGroup=metric&key=${weatherApiKey}&contentType=json&lang=pl&iconSet=icons2`
    return await (await fetch(url)).json()
}

const updateTime = () =>{
    const now = new Date()
    document.getElementById("hour").innerText = now.toLocaleTimeString("pl", {timeStyle: "short"})
    document.getElementById("date").innerText = now.toLocaleDateString("pl", {dateStyle: "full"})
}

updateTime()
setInterval(updateTime, 1000)

const updateWeather = async () => {
    const weather = await getWeather(loc)
    console.log(weather)
    document.getElementById("current").style.backgroundImage = `url("./conditionImages/${weather.currentConditions.icon}.jpg")`
    document.getElementById("currentTemp").innerText = `${Math.round(weather.currentConditions.temp)}°C`
    document.getElementById("currentConditions").innerText = weather.currentConditions.conditions
    document.getElementById("currentHumidity").innerText = `${Math.round(weather.currentConditions.humidity)}% 💧`
    document.getElementById("currentWindSpeed").innerText = `${Math.round(weather.currentConditions.windspeed)}km/h 🍃`
    document.getElementById("currentUVIndex").innerText = `${weather.currentConditions.uvindex} ☀️`
    const forecastSlider = document.getElementById("forecastSlider")
    document.getElementById("navButtons").innerHTML = ""
    for(const index in weather.days){
        const day = weather.days[index]
        const t = new Date(day.datetime)
        const div = document.createElement("div")
        div.className = "forecastDay"
        div.innerHTML = `
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
        `
        forecastSlider.appendChild(div)
        const radio = document.createElement("input")
        radio.type = "radio"
        radio.value = index
        radio.name = "selectedDay"
        radio.checked = index==0
        radio.onclick = () => selectDay(index)
        document.getElementById("navButtons").appendChild(radio)

    }
    
    selectDay(0)
}

const selectDay = (day)=>{
    const l = document.getElementById("forecastSlider").children.length
    for (let i = 0; i < l; i++) {
        document.getElementById("forecastSlider").children.item(i).style.display = "none"
    }
    document.getElementById("forecastSlider").children.item(day).style.display = "flex"
}

updateWeather()
setInterval(updateWeather, 600000)