'use client'

import { Box, Tab, Tabs } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  const router = useRouter()

  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        // Routing libraries handle this, you can remove the onClick handle when using them.
        event.preventDefault()
        const target = event.target as HTMLAnchorElement
        const href = target.href

        router.push(href)
      }}
      {...props}
    />
  )
}

export default function Navigation() {
  const pathname = usePathname()

  const [value, setValue] = useState(pathname === '/plot' ? 1 : 0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 1 }}>
      <Tabs value={value} onChange={handleChange}>
        <LinkTab label="Images" href="/" />
        <LinkTab label="Plot" href="/plot" />
      </Tabs>
    </Box>
  )
}
