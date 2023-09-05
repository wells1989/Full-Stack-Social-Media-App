import { Box } from '@mui/material';
import { styled } from '@mui/system';

const WidgetWrapper = styled(Box)(({ theme }) => ({ // passing in theme to be used below ...
    padding: "1.5rem 1.5rem 0.75rem 1.5rem", // top right bottom left settings
    backgroundColor: theme.palette.background.alt,
    borderRadius: "0.75rem"
}));

export default WidgetWrapper;

// style component, to pass in css properties