export interface LensIconProps {
    kind: 'mirrored' | 'look' | 'comment' | 'like'
    size?: number,
    color?: string
}

function LensIcons(props: LensIconProps) {

    return (<>
        {
            props.kind === 'mirrored' &&
            <svg width={props.size || '20'} height={props.size || '20'} viewBox="0 0 20 20" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <g id="mirror">
                    <path id="Vector 438"
                          d="M3.67773 7.38977H16.3223M16.3223 7.38977L13.8783 4.41457M16.3223 7.38977L13.8783 10.1909"
                          stroke={props.color || '#C6C9C5'} strokeWidth="1.5" strokeLinecap="round"
                          strokeLinejoin="round"/>
                    <path id="Vector 439"
                          d="M16.3223 13.6102L3.67773 13.6102M3.67773 13.6102L6.12168 16.5854M3.67773 13.6102L6.12168 10.6464"
                          stroke={props.color || '#C6C9C5'} strokeWidth="1.5" strokeLinecap="round"
                          strokeLinejoin="round"/>
                </g>
            </svg>
        }

        {
            props.kind === 'look' &&
            <svg width={props.size || '12'} height={props.size || '12'} xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" strokeWidth="2"
                 stroke="currentColor" aria-hidden="true" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
        }

        {
            props.kind === 'comment' &&
            <svg width={props.size || '20'} height={props.size || '20'} xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" strokeWidth="2"
                 stroke="currentColor" aria-hidden="true" className="w-[15px] sm:w-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round"
                      stroke={props.color || '#C6C9C5'}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
            </svg>
        }

        {
            props.kind === 'like' &&
            <svg width={props.size || '20'} height={props.size || '20'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
                 stroke="currentColor" aria-hidden="true" className="w-[15px] sm:w-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round"
                      stroke={props.color || '#C6C9C5'}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
        }
    </>)
}

export default LensIcons
