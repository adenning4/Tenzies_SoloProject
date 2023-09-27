import React from "react"

export default function Die(props) {
    
    function getBackgroundColor() {
        if (props.running) {
            if (props.isHeld) {
                return "#59E391"
            } else {
                return "white"
            }
        } else {
            return "#aaa"
        }
    }
    
    const styles = {
        backgroundColor: getBackgroundColor()
    }
    return (
        <div 
            className="die-face" 
            style={styles}
            onClick={props.holdDice}
        >
            <h2 className="die-num">{props.value}</h2>
        </div>
    )
}