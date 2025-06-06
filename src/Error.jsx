import React from "react"
import Headers from "./header.jsx"
import ErrorGif from "./assets/404.gif"


function ErrorPage() {
    return (
        <div>
            <Headers />
            <div className="col-sm-12 text-center">
                <h2>Error 404, couldn't find the page you are looking for</h2>
                <img src={ErrorGif} alt="error gif"></img>
            </div>
        </div>
    )
}

export default ErrorPage