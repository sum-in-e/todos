import React from 'react';
import Task from './Task';

interface IProps {
	date: string;
	tasks: [];
}

const TaskContainer: React.FunctionComponent<IProps> = ({ date, tasks }) => {
	return (
		<>
			<strong>{date}</strong>
			<div>
				{tasks && tasks.length > 0 && tasks.map((task: any, index: any) => <Task key={index} task={task} />)}
			</div>
		</>
	);
};

export default TaskContainer;
