import React, { useState } from 'react';
import styled from 'styled-components';
import { defualtFirebase, dbService } from '../fbase';
import EditTaskForm from './EditTaskForm';
import { EditAlt } from 'styled-icons/boxicons-regular';
import { DeleteBin } from 'styled-icons/remix-line';

interface IProps {
	date: string;
	taskKey: string;
	taskValue: string;
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	getTasks: () => void;
}

const CompletedTask: React.FunctionComponent<IProps> = ({ date, taskKey, taskValue, userInfo, getTasks }) => {
	const [editedDate, setEditedDate] = useState<string>('날짜미정');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const temporaryStorage: any = {};

	const relocation = async (): Promise<void> => {
		const doc = dbService.doc(`${userInfo.uid}/${date}`);
		const data = (await doc.get()).data();
		if (data !== undefined) {
			const values = Object.values(data);
			values.forEach((value, index): void => {
				temporaryStorage[index] = value;
			});
			await doc.set(temporaryStorage);
			console.log('relocation 끝');
		}
	};
	const onEditClick = () => {
		setIsEditing(true);
		setEditedDate('날짜미정');
	};

	const onExitEditing = () => {
		setIsEditing(false);
	};

	const onDeleteClick = async (): Promise<void> => {
		if (userInfo.uid !== null) {
			const doc = dbService.doc(`${userInfo.uid}/${date}`);
			const data = (await doc.get()).data();
			try {
				for (const key in data) {
					if (key === taskKey) {
						await doc.update({
							[key]: defualtFirebase.firestore.FieldValue.delete(),
						});
						await relocation();
					}
				}
			} catch (err) {
				alert(err.message);
			} finally {
				getTasks();
			}
		}
	};

	return (
		<>
			{isEditing ? (
				<EditTaskForm
					date={date}
					taskKey={taskKey}
					taskValue={taskValue}
					userInfo={userInfo}
					getTasks={getTasks}
					isEditing={isEditing}
					editedDate={editedDate}
					setEditedDate={setEditedDate}
					onExitEditing={onExitEditing}
					isCompleted={true}
				/>
			) : (
				''
			)}
			<Container>
				<Task>{taskValue}</Task>
				<BtnWrapper>
					<EditI onClick={onEditClick} />
					<DeleteI onClick={onDeleteClick} />
				</BtnWrapper>
			</Container>
		</>
	);
};

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
`;
const Task = styled.span`
	color: ${props => props.theme.light.whiteColor};
	text-decoration: line-through;
`;

const BtnWrapper = styled.div``;

const EditI = styled(EditAlt)`
	width: 1rem;
	margin-right: 0.2rem;
	color: ${props => props.theme.light.grayColor};
`;

const DeleteI = styled(DeleteBin)`
	width: 1rem;
	color: ${props => props.theme.light.grayColor};
`;

export default CompletedTask;
