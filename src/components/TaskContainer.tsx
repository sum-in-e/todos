import React from 'react';
import Task from './Task';
import CompletedTask from './CompletedTask';

interface IProps {
	date: string;
	tasks: string[];
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: object) => void;
	};
	getTasks: () => void;
}

const TaskContainer: React.FunctionComponent<IProps> = ({ date, tasks, userInfo, getTasks }) => {
	return (
		<>
			<strong>{date}</strong>
			<div>
				{date === '완료'
					? tasks.map((task: string, index: number) => (
							<CompletedTask
								key={index}
								date={date}
								task={task}
								userInfo={userInfo}
								getTasks={getTasks}
							/>
					  ))
					: tasks.map((task: string, index: number) => (
							<Task key={index} date={date} task={task} userInfo={userInfo} getTasks={getTasks} />
					  ))}
			</div>
		</>
	);
};

export default TaskContainer;
