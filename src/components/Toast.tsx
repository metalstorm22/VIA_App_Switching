import React, {useEffect} from 'react';
import styled from 'styled-components';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getAppProfilesState, hideToast} from 'src/store/appProfilesSlice';

const ToastWrap = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  z-index: 10000;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
`;

export const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((s) => getAppProfilesState(s).toast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(hideToast()), 3000);
    return () => clearTimeout(t);
  }, [toast?.at]);
  if (!toast) return null;
  return <ToastWrap role="status">{toast.message}</ToastWrap>;
};

