import React from "react";
import Header from "./header.jsx"
import smuMascot from "./assets/smumascot.png"
import Courses from "./courses.jsx"

function Smu() {
    return (
        <>
        <Header />
        <div className="d-flex justify-content-center">
            <img src={smuMascot} alt="Ntu Mascot" className="img-fluid mascot" />
        </div>
        <Courses />
        </>
    )
}

export default Smu