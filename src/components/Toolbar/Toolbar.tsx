import { Button, Slide, useMediaQuery } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import AppToolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import GamesIcon from '@material-ui/icons/Games';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MergeTypeOutlinedIcon from '@material-ui/icons/MergeTypeOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import BookOutlinedIcon from '@material-ui/icons/MenuBookOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import { useHistory } from 'react-router-dom';
// Removed missing './Toolbar.css'; using Tailwind utilities instead.
import { useTranslation } from 'react-i18next';
export const title = 'Planning Poker';

export const Toolbar = () => {
  const history = useHistory();
  const isSmallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('xs'));
  const { t } = useTranslation();

  return (
    <Slide direction='down' in={true} timeout={800}>
      <AppBar position='sticky' className='bg-gray-900'>
        <AppToolbar>
          <div className='flex w-full items-center justify-between'>
            <div className='flex cursor-pointer items-center space-x-2' onClick={() => history.push('/')}>
              <GamesIcon className='text-white' />
              <Typography variant={isSmallScreen ? 'subtitle1' : 'h5'} color='inherit' noWrap>
                {title}
              </Typography>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                title={t('toolbar.menu.about')}
                startIcon={<InfoOutlinedIcon />}
                color='inherit'
                onClick={() => history.push('/about-planning-poker')}
              >
                {!isSmallScreen ? t('toolbar.menu.about') : null}
              </Button>
              <Button
                title={t('toolbar.menu.guide')}
                startIcon={<SearchOutlinedIcon />}
                color='inherit'
                onClick={() => history.push('/guide')}
              >
                {!isSmallScreen ? t('toolbar.menu.guide') : null}
              </Button>
              <Button
                title={t('toolbar.menu.examples')}
                startIcon={<BookOutlinedIcon />}
                color='inherit'
                onClick={() => history.push('/examples')}
              >
                {!isSmallScreen ? t('toolbar.menu.examples') : null}
              </Button>
              <Button
                title={t('toolbar.menu.newSession')}
                startIcon={<AddCircleOutlineIcon />}
                color='inherit'
                onClick={() => history.push('/')}
                data-testid='toolbar.menu.newSession'
              >
                {!isSmallScreen ? t('toolbar.menu.newSession') : null}
              </Button>
              <Button
                title={t('toolbar.menu.joinSession')}
                startIcon={<MergeTypeOutlinedIcon />}
                size={isSmallScreen ? 'small' : 'large'}
                color='inherit'
                onClick={() => history.push('/join')}
                data-testid='toolbar.menu.joinSession'
              >
                {!isSmallScreen ? t('toolbar.menu.joinSession') : null}
              </Button>
            </div>
          </div>
        </AppToolbar>
      </AppBar>
    </Slide>
  );
};