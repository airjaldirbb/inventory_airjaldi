import React, { useState } from 'react'



const Test = () => {
        const a=-2;
        const b = 5;
        const x=a+b;
        console.log(x)
    const [courseDuration, setCourseName] = useState('2 months')
    const [rollNo, setRollNo] = useState(123)
    const [isActive, setIsActive] = useState(false)
    const [currentData, setCurrentDate] = useState(new Date)
    const [state, setState] = useState('HP')
    const [student, setStudent] = useState({
        name: 'jayoti',
        age: 35,
        city: 'Kullu'
    })

    const [city, setCityList] = useState(['Pune', 'Mumbai'])

    const changeDuration = () => {
        setCourseName('Angular')

    }

    const changeRollNo = (event) => {
        setRollNo(event.target.value);
    }
    const changeState = (event) => {
        setState(event.target.value)
    }

    const onActive = (event) => {
        setIsActive(event.target.checked)
        console.log(event.target.checked)
    }
    return (
        <div>
            <p>{courseDuration}</p>
            <p>{rollNo}</p>
            <p>{state}</p>
            <p>{isActive}</p>
            the value of x is :{x} <br/>
            <input type='text' onChange={(event) => changeRollNo(event)} />

            <select onChange={(event) => changeState(event)}>
                <option>Goa</option>
                <option>Delhi</option>
                <option>Pune</option>
                <option>Mh</option>
            </select>

            <button type='button' onClick={changeDuration} >Click here </button>
            <input type='checkbox' onChange={(event) => onActive(event)} />


        </div>
    )
}

export default Test