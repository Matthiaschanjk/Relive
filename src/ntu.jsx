import React from "react";
import Header from "./header.jsx"
import ntuMascot from "./assets/ntumascot.png"
import Courses from "./courses.jsx"

function Ntu() {
    return (
        <>
        <Header />
        <div className="d-flex justify-content-center">
            <img src={ntuMascot} alt="Ntu Mascot" className="img-fluid mascot" />
        </div>
        <Courses />
        </>
    )
}

export default Ntu