import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type CloseButtonProps = {
    to: string;
    top?: number;
    right?: number;
};

export const CloseButton = ({to, top = 76, right = 16}: CloseButtonProps) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ position: 'fixed', top, right, zIndex: 1300 }}>
            <IconButton onClick={() => navigate(to)}>
                <CloseIcon />
            </IconButton>
        </Box>
    );
};
