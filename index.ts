

interface Entity {

}

interface WishDeclaration {

}

const isa = Symbol()

interface IRef {

}

declare const Ref: (name: string) => IRef

interface Predicate {

}

// type ClaimDeclaration = (...arggs)

type RType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
type SomeClaim = (...args: any) => ClaimDeclaration

type BindingContext = any

interface WhenBuilder {
    and(ref: IRef, predicate: Predicate): WhenBuilder
    then(block: (ctx: BindingContext) => void): void
}

type ClaimAtom = number | string
type ClaimDeclaration = ClaimAtom | { [key: string]: ClaimAtom } | object

interface BoundingBox {
    right: number
    bottom: number
    left: number
    top: number
}
interface GeomapParams {
    bbox: BoundingBox
}
const geomap = (params: GeomapParams) => {
    return params
}


// Claim (you) blahblahblah
// Claim (you) is geomap of bbox ({left=-122.527, bottom=37.664, right=-122.348, top=37.851})
declare const claim: (ref: IRef, claimDeclaration: ClaimDeclaration) => void
claim(Ref("you"), "blahblahblah")
claim(Ref("you"), is(geomap({ bbox: { left: -122.527, bottom: 37.664, right: -122.348, top: 37.851 } })))

// When /page/ blahblahblah:
// When /map/ is geomap of box /bbox/:
// When /map/ is geomap of bbox /bbox/, /map/ has width /width/, /map/ has height /height/:
// When /someone/ wishes /page/ shows tilelayer /url_template/ with options /opts/, /page/ wishes /target/ shows tilelayer /something/ with options /something/, page ~= target:
// When /someone/ wishes /map/ shows tilelayer /url_template/ with options /opts/, /map/ is geomap of bbox /bbox/, /map/ has width /width/, /map/ has height /height/:
// When tile URL (url) is downloaded to path (path):
declare const when: (ref: IRef, predicate: Predicate) => WhenBuilder
when(Ref("page"), "blahblahblah")
when(Ref("map"), is({
    geomap: {
        bbox: Ref("bbox")
    }
}))
    .and(Ref("map"), has("width", Ref("width")))
    .and(Ref("map"), has("height", Ref("height")))
    .then(({ bbox, height, width }) => {

    })

// Wish (page) is highlighted "blue".
// Wish (map) has illumination (ill).
// Wish (map) shows tilelayer "http://demographics.virginia.edu/DotMap/tiles4/%d/%d/%d.png" with options ({max_zoom=13}).
// Wish (target) shows tilelayer (url_template) with options (opts).
declare const wish: (entity: Entity, declarations: WishDeclaration[]) => void

////////////////