import React from 'react';

interface IProps {
	date: string;
	tasks: [];
}

const Task: React.FunctionComponent<IProps> = ({ date, tasks }) => {
	return (
		<>
			<div>{date}</div>
			<div>
				{tasks && tasks.length > 0 && tasks.map((task: any, index: any) => <div key={index}>{task}</div>)}
			</div>
		</>
	);
};

export default Task;
