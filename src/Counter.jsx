import { useState }  from "react";
import './counter.css';

function counter(){

    const [counter,setCounter] = useState(0);

    const Increment = () =>  {
        setCounter(counter+1)
    }

    const decrement = () => {
        setCounter(counter-1)
    }

    const reset = () => {
        setCounter(0)
    }

    return(
        <>
        <div className="counter-overall">
            <p className="count-display">{counter}</p>
            <button className="button" onClick={decrement}> Decrement</button>
            <button className="button" onClick={reset}>Reset</button>
            <button className="button" onClick={Increment}>Increment</button>
        </div>
        </>
    );
}

export default counter