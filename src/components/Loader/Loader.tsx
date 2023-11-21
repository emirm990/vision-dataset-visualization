import { CircularProgress, Grid, Typography } from '@mui/material'

type Props = {
  label?: string,
}

export default function Loader(props: Props) {
  const {
    label,
  } = props

  return (
    <Grid
      container
      spacing={0}
      marginTop="100px"
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress />
      <Typography>
        { label ?? null }
      </Typography>
    </Grid>
  )
}
