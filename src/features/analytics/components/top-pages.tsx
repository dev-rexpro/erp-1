import { Ellipsis } from 'lucide-react'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const lanes = [
  { lane: 'Shanghai (CNSHA) → Rotterdam (NLRTM)', volume: '18.2k TEUs', transit: '28 days', delay: '4.2%' },
  { lane: 'Singapore (SGSIN) → Los Angeles (USLAX)', volume: '14.5k TEUs', transit: '18 days', delay: '3.1%' },
  { lane: 'Nhava Sheva (INBOM) → Rotterdam (NLRTM)', volume: '9.6k TEUs', transit: '24 days', delay: '5.8%' },
  { lane: 'Shanghai (CNSHA) → Oakland (USOAK)', volume: '8.4k TEUs', transit: '16 days', delay: '2.5%' },
  { lane: 'Singapore (SGSIN) → Rotterdam (NLRTM)', volume: '7.1k TEUs', transit: '22 days', delay: '6.9%' },
]

export function TopPages() {
  return (
    <Card className='h-full gap-2'>
      <CardHeader>
        <CardTitle className='font-normal text-sm'>Trade Lane Performance</CardTitle>
        <CardAction>
          <Ellipsis className='size-4' />
        </CardAction>
      </CardHeader>

      <CardContent className='px-0'>
        <Table className='[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4 text-xs font-sans font-medium'>
          <TableHeader className='[&_tr]:border-border/50 bg-muted [&_tr]:bg-muted [&_tr]:hover:bg-muted'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-8'>Lane Route</TableHead>
              <TableHead className='h-8 w-24 text-right font-medium'>Volume</TableHead>
              <TableHead className='h-8 w-24 text-right font-medium'>Avg Transit</TableHead>
              <TableHead className='h-8 w-20 text-right font-medium'>Customs Delay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='[&_tr]:border-border/50'>
            {lanes.map((lane) => (
              <TableRow className='hover:bg-transparent' key={lane.lane}>
                <TableCell className='max-w-0 truncate py-4'>{lane.lane}</TableCell>
                <TableCell className='text-right tabular-nums text-foreground'>{lane.volume}</TableCell>
                <TableCell className='text-right text-muted-foreground tabular-nums'>{lane.transit}</TableCell>
                <TableCell className='text-right text-muted-foreground tabular-nums'>{lane.delay}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
