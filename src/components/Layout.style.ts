import {SxProps, Theme} from '@mui/material/styles';

export const drawerWidth = 237;
export const collapsedWidth = 64;

export const appBarSx = (open: boolean): SxProps<Theme> => ({
    width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
    ml: `${open ? drawerWidth : collapsedWidth}px`,
    height: '73px',
    bgcolor: '#D5D5D5',
    color: '#5A5A5A',
    boxShadow: 'none',
    justifyContent: 'center',
});

export const toolbarSx = {
    display: 'flex',
    justifyContent: 'space-between',
};

export const drawerSx = (open: boolean): SxProps<Theme> => ({
    width: open ? drawerWidth : collapsedWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
        width: open ? drawerWidth : collapsedWidth,
        transition: 'width 0.3s',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        bgcolor: '#292929',
        color: 'white',
        padding: open ? '25px' : '8px',
    },
});

export const drawerToolbarSx = (open: boolean): SxProps<Theme> => ({
    display: 'flex',
    justifyContent: open ? 'flex-end' : 'center',
    alignItems: 'center',
    minHeight: '73px',
    maxHeight: '73px',
    px: 0,
});

export const listItemButtonSx = (open: boolean): SxProps<Theme> => ({
    backgroundColor: '#514F4F',
    borderRadius: '8px',
    mb: 2,
    '&:hover': {
        backgroundColor: '#6b6969',
    },
    justifyContent: open ? 'initial' : 'center',
    px: 2,
});

export const listItemIconSx = (open: boolean): SxProps<Theme> => ({
    color: 'white',
    minWidth: 0,
    mr: open ? 2 : 'auto',
    justifyContent: 'center',
});

export const listItemTextSx = (open: boolean): SxProps<Theme> => ({
    opacity: open ? 1 : 0,
    transition: 'opacity 0.2s',
});

export const mainContentSx = {
    flexGrow: 1,
    bgcolor: '#f3f0f2',
    p: 3,
    mt: '73px',
    minHeight: 'calc(100vh - 73px)',
};
