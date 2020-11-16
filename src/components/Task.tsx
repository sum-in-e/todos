import React from 'react';
import styled from 'styled-components';
import { Edit } from 'styled-icons/boxicons-regular';

interface IProps {
	task: string;
}

const Task: React.FunctionComponent<IProps> = ({ task }) => {
	return (
		<>
			<div>{task}</div>
			<EditIcon />
		</>
	);
};

const EditIcon = styled(Edit)`
	width: 20px;
`;

export default Task;
