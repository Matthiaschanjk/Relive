import React from "react";
import Header from "./header.jsx"
import nusMascot from "./assets/nusmascot.png"
import Courses from "./courses.jsx"
import AddCourses from "./addCourse.jsx";

function Nus() {
    return (
        <>
        <Header />
        <div className="d-flex justify-content-center">
            <img src={nusMascot} alt="Nus Mascot" className="img-fluid mascot" />
        </div>
        <AddCourses school="nus" />
        <Courses school="nus" />
        </>
    )
}

export default Nus