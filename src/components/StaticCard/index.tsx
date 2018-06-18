import * as React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ArrowIcon from '@material-ui/icons/TrendingFlat'

const styles = require('./styles')

interface StaticCardProps {
  index?: number
  icon: string
  title: string
  page?: string
  className?: string
  children?: React.ReactNode
}

export default (props: StaticCardProps) => (
  <Card className={props.className || ''} elevation={0}>
    <CardContent
      classes={{
        root: styles.cardContentRoot,
      }}
    >
      <h2 className={styles.title}>
        <span>
          <svg className="icon" aria-hidden="true">
            <use xlinkHref={`#icon-${props.icon}`} />
          </svg>
          {props.title}{' '}
        </span>
        {props.page ? (
          <a href={`/#/${props.page}`} className={styles.more}>
            More
            <ArrowIcon />
          </a>
        ) : null}
      </h2>
      {props.children}
    </CardContent>
  </Card>
)