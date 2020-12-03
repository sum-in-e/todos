import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../fbase';
import styled from 'styled-components';
import { Edit } from 'styled-icons/entypo';
import { Save } from 'styled-icons/foundation';
import { CancelCircle } from 'styled-icons/icomoon';
import ProfileImg from './ProfileImg';

interface IProps {
	userInfo: {
		uid: string | null;
		displayName: string | null;
		updateProfile: (args: { displayName: string | null }) => void;
	};
	reRender: () => void;
}

const MyProfile: React.FunctionComponent<IProps> = ({ userInfo, reRender }) => {
	const [userName, setUserName] = useState<string | null>(userInfo.displayName);
	const [toggleEdit, setToggleEdit] = useState<boolean>(false);
	const [showingProfileImg, setShowingProfileImg] = useState<string>('');

	const imgRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const mainRef = React.useRef() as React.MutableRefObject<HTMLElement>;
	const editRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
	const iconRef = React.useRef() as React.MutableRefObject<SVGSVGElement>;
	const logOutRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		if (userName !== userInfo.displayName) {
			try {
				await userInfo.updateProfile({
					displayName: userName,
				});
			} catch (err) {
				alert(err.message);
			} finally {
				setToggleEdit(prev => !prev);
				reRender();
			}
		} else if (userName === userInfo.displayName) {
			alert('변경 사항이 없습니다');
		}
	};

	const onTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {
			target: { value },
		} = e;
		setUserName(value);
	};

	const onToggleClick = (): void => {
		setToggleEdit(prev => !prev);
	};

	const onLogOutClick = (): void => {
		authService.signOut();
	};

	const onProfileClick = () => {
		mainRef.current.classList.add('showing');
		window.addEventListener('click', onOutsideClick);
	};

	const onOutsideClick = (e: any) => {
		const isInside = editRef.current.contains(e.target as Node);
		if (isInside) {
			console.log('내부 클릭');
			if (e.target === iconRef.current || e.target.parentNode === iconRef.current) {
				onToggleClick();
			}
		} else if (imgRef.current === e.target) {
			console.log('showing profile 클릭');
		} else if (logOutRef.current === e.target || logOutRef.current === e.target.parentNode) {
			console.log('로그아웃 클릭');
			window.removeEventListener('click', onOutsideClick);
			onLogOutClick();
		} else {
			console.log('바깥 클릭');
			window.removeEventListener('click', onOutsideClick);
			mainRef.current.classList.remove('showing');
		}
	};

	return (
		<Container>
			<ImgWrapper>
				<ShowingProfileImg ref={imgRef} onClick={onProfileClick} imgUrl={showingProfileImg} />
			</ImgWrapper>
			<Main ref={mainRef}>
				<EditWrapper ref={editRef}>
					<ProfileImg userInfo={userInfo} setShowingProfileImg={setShowingProfileImg} />
					{toggleEdit ? (
						<FormWrapper>
							<Form onSubmit={onSubmit}>
								<TextInput
									type="text"
									placeholder="Name"
									value={userName && userName ? userName : ''}
									onChange={onTextChange}
									autoFocus
									required
								/>
								<SaveWrapper type="submit">
									<SaveIcon />
								</SaveWrapper>
							</Form>
							<CancelIcon ref={iconRef} />
						</FormWrapper>
					) : (
						<NameWrapper>
							<UserName>{userName ? userName : 'User'}</UserName>
							<EditIcon ref={iconRef} />
						</NameWrapper>
					)}
				</EditWrapper>
				<LogOutBtn ref={logOutRef}>
					<span>LOG OUT</span>
				</LogOutBtn>
			</Main>
		</Container>
	);
};

const Container = styled.section`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: fixed;
	top: 0.5rem;
	right: 0.5rem;
	z-index: 10;
`;

const ShowingProfileImg = styled.div<{ imgUrl: string }>`
	width: 2rem;
	height: 2rem;
	margin-bottom: 1rem;
	border: 2px solid ${props => props.theme.light.whiteColor};
	border-radius: 30px;
	background-image: url(${props => props.imgUrl});
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
`;

const Main = styled.main`
	display: none;
	flex-direction: column;
	align-items: center;
	position: relative;
	height: 10rem;
	width: 8rem;
	border-radius: 15px;
	background-color: ${props => props.theme.light.greenColor};
	box-shadow: 0px 0px 5px 0px rgba(255, 255, 255, 0.84);
	&.showing {
		display: flex;
	}
`;

const ImgWrapper = styled.div``;

const EditWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	padding: 1rem;
`;

const FormWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Form = styled.form`
	display: flex;
	align-items: center;
	height: 1rem;
`;

const TextInput = styled.input`
	width: 3rem;
	margin-right: 3px;
	border: none;
	border-bottom: 1px solid ${props => props.theme.light.yellowColor};
	background: none;
	font-size: 0.7rem;
	color: ${props => props.theme.light.yellowColor};
	&:focus {
		outline: none;
	}
	&::placeholder {
		color: ${props => props.theme.light.grayColor};
	}
`;

const SaveWrapper = styled.button`
	display: flex;
	align-items: center;
	margin-right: 3px;
	padding: 0;
	border: none;
	background: none;
	outline: none;
`;

const SaveIcon = styled(Save)`
	height: 0.7rem;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
`;

const CancelIcon = styled(CancelCircle)`
	height: 0.7rem;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
`;

const NameWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const UserName = styled.span`
	font-size: 0.7rem;
	color: ${props => props.theme.light.yellowColor};
`;

const EditIcon = styled(Edit)`
	height: 0.7rem;
	margin-left: 5px;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
`;

const LogOutBtn = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: 0px;
	height: 2rem;
	width: 100%;
	border-top: 1px solid ${props => props.theme.light.yellowColor};
	border-radius: 0 0 15px 15px;
	font-size: 0.7rem;
	font-weight: 700;
	color: ${props => props.theme.light.yellowColor};
	cursor: pointer;
	transition: all 0.3s;
`;

export default MyProfile;
