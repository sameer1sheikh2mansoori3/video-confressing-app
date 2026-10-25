import  {  useState } from 'react'
 const valueLelo = ()=>{
        const arr = localStorage.getItem("key");
        if(arr===null)return [];
        return JSON.parse(arr);
    }
const valueDedo = (arr)=>{
    
     localStorage.setItem("key" , JSON.stringify(arr));
}
function ProductTab() {
   
    let [taskArr, setTaskArr] = useState(valueLelo);

    const [taskData , setTaskData] = useState();
    const [taskName , setTaskName] = useState("");
    const [isCompleted , setIsCompleted] = useState(false);
    const valueUpdate = (value)=>{
        console.log(value);
        setTaskName(value.target.value)
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if (taskName.trim() === '') {
            alert("Enter a task name.");
            return;
        }
        const newTaskArr = [
            ...taskArr,
            {
                taskName: taskName,
                isCompleted: isCompleted,
            },
        ];
        setTaskArr(newTaskArr);
        valueDedo(newTaskArr);
        setTaskName("");
    }
    const toggleTaskStatus = (indexOfArr) =>{
      const newArr =   taskArr.map((value,index)=>{
            if(index === indexOfArr){
                return {
                    taskName : value.taskName,
                    isCompleted:!value.isCompleted
                }
            }
            return value;
        })
        valueDedo(newArr);
        
        setTaskArr(valueLelo());
    }
  return (
   <>
   <div>
    <form>
    <input  value={taskName} type='text' src="" alt="" onChange={valueUpdate} />
    <button type='submit' onClick={onSubmit}>submit task</button>
    </form>
    <div>
        {
            taskArr.map((value , index)=><>
            <div key={index}>
                <h1>{value.taskName}</h1>
                <button type="button" onClick={() => toggleTaskStatus(index)} aria-label={value.isCompleted ? "Completed" : "Incomplete"}>{value.isCompleted ? "Completed" : "Incomplete"}</button>
            </div>
            </>)
        }
    </div>
    
   </div>
   </>
    
  )
}

export default ProductTab;