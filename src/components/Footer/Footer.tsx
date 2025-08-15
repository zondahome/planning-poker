import { Divider, Slide, Typography } from '@material-ui/core';

export const Footer = () => {
  return (
    <footer className='mt-16 pb-8'>
      <Slide in={true} direction='up' timeout={3000}>
        <div className='mx-auto max-w-5xl px-4'>
          <Divider variant='middle' />
          <div className='mt-6 flex items-center justify-center'>
            <Typography color='textSecondary' variant='body2'>
              Zonda Home Planning Poker Instance
            </Typography>
          </div>
        </div>
      </Slide>
    </footer>
  );
};
