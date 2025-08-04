import React from "react";
import Header from "./header.jsx"
import smuMascot from "./assets/smumascot.png"
import Courses from "./courses.jsx"
import AddCourses from "./addCourse.jsx";

function Smu() {
    return (
        <>
        <Header />
        <div className="d-flex justify-content-center">
            <img src={smuMascot} alt="smu Mascot" className="img-fluid mascot" />
        </div>
        <AddCourses school="smu" />
        <Courses school="smu"/>
        </>
    )
}

export default Smu
