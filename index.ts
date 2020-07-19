
interface WishDeclaration {

}

const isa = Symbol()

interface IRef {
    label: string
}

interface Predicate {

}

// type ClaimDeclaration = (...arggs)

type RType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
type SomeClaim = (...args: any) => ClaimDeclaration

interface IWhenBuilder {
    and(label: string, predicate: Predicate[]): IWhenBuilder
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

const is = (claimDeclaration: ClaimDeclaration) => {
    return [{ is: claimDeclaration }]
}

interface BindingPredicate { }
const has = (propertyKey: string, refToBindTo: IRef): BindingPredicate[] => {
    return [{
        [propertyKey]: refToBindTo
    }]
}

type BoundRef = IRef
type Value<P extends Primitive> = BoundRef | P

interface Primitive { }

interface Illumination extends Primitive {

}

const highlighted = (color: Value<string>) => {
    return [{
        highlightColor: color
    }]
}
const hasIllumination = (ill: Value<Illumination>) => {
    return [{
        illumination: ill
    }]
}

interface TilelayerConfig {
    url: Value<string>,
    options: Value<{ max_zoom: number }>
}
const showsTilelayer = (tilelayerConfig: any) => {
    return [
        {
            showsTileLayer: tilelayerConfig
        }
    ]
}

//////////////////////////////////

class $Ref {
    constructor(public label: string) { }

    toString(): string {
        return `$${this.label}`
    }
}

type BindingContext = { [key: string]: IRef }

class Bindings {
    scopes: BindingContext[] = [{}]

    resolve = () => {
        const ctx: BindingContext = {}

        for (const scope of this.scopes) {
            for (const key in scope) {
                ctx[key] = scope[key]
            }
        }

        return ctx
    }

    makeRef = (label: string): IRef => {
        const resolved = this.resolve()
        if (resolved[label]) {
            return resolved[label]
        }

        const scope = this.scopes[this.scopes.length - 1]
        const ref = new $Ref(label)
        scope[label] = ref
        return ref
    }

    dump = () => {
        const [globalScope, ...others] = this.scopes

        console.log("GLOBAL: ", globalScope)
        others.forEach((scope, idx) => {
            console.log(`SCOPE ${idx}: `, scope)
        })
    }
}

class Entity {
    static current = new Entity()

    static getCurrent = () => {
        return Context.current
    }
}

type ConditionalBlock = (ctx: any) => void

// TODO: entity storage
// TODO: per-entity context / global context split
// TODO: resolving conditionals and executing conditional blocks
class Context {

    static current = new Context()

    static get = () => {
        return Context.current
    }

    claims: [Entity, IRef, ClaimDeclaration][] = []
    wishes: [Entity, IRef, WishDeclaration][] = []
    conditionals: [[string, Predicate][], ConditionalBlock][] = []

    bindings: Bindings = new Bindings()

    addClaim = (ref: IRef, claimDeclaration: ClaimDeclaration) => {
        this.claims.push([Entity.getCurrent(), ref, claimDeclaration])
    }

    addWish = (ref: IRef, wishDeclaration: WishDeclaration) => {
        this.wishes.push([Entity.getCurrent(), ref, wishDeclaration])
    }

    makeRef = (label: string) => {
        return this.bindings.makeRef(label)
    }

    clear = () => {
        this.claims = []
        this.wishes = []
        this.bindings = new Bindings()
        this.conditionals = []
    }

    addConditional = (predicates: [string, Predicate][], block: ConditionalBlock) => {
        this.conditionals.push([predicates, block])
    }

    resolveConditionals = () => {
        for (const conditional of this.conditionals) {
            const [predicates, block] = conditional;
            this.resolveConditional(predicates, block)
        }
    }

    resolveConditional = (predicates: [string, Predicate][], block: ConditionalBlock) => {
        // FIXME: actually implement this
    }


    dumpClaims = () => {
        for (const claim of this.claims) {
            console.log(`Claim ${claim[0]} --`, claim[1])
        }
    }

    dumpWishes = () => {
        for (const wish of this.wishes) {
            console.log(`Wish ${wish[0]} --`, wish[1])
        }
    }

    dumpBindings = () => {
        this.bindings.dump()
    }

    dump = () => {
        this.dumpClaims()
        this.dumpWishes()
        this.dumpBindings()
    }
}

//////////////////////////////////////

const claim = (ref: IRef, declarations: ClaimDeclaration[]) => {
    const context = Context.get()
    for (const decl of declarations) {
        context.addClaim(ref, decl)
    }
}

class WhenBuilder implements IWhenBuilder {
    predicates: [string, Predicate][] = []

    addPredicate = (label: string, declarations: Predicate[]) => {
        this.predicates.push([label, declarations])
    }

    and(label: string, predicate: Predicate[]): IWhenBuilder {
        this.addPredicate(label, predicate)
        return this
    }

    then(block: (ctx: any) => void): void {
        const ctx = Context.get()
        ctx.addConditional(this.predicates, block)
    }
}

const when = (label: string, predicate: Predicate): IWhenBuilder => {
    const builder = new WhenBuilder()
    builder.addPredicate(label, [predicate])
    return builder
}

interface WishesPredicate { }

const wishes = (ref: IRef, declarations: WishDeclaration[]): WishesPredicate[] => {
    return [{
        wishes: declarations.map((decl) => {
            return [ref, decl]
        })
    }]
}

interface MatchesPredicate { }

const matches = (ref: IRef): MatchesPredicate[] => {
    return [{ matches: ref }]
}

const wish = (ref: IRef, declarations: WishDeclaration[]) => {
    const context = Context.get()
    declarations.forEach(decl => {
        context.addWish(ref, decl)
    })
}


const Ref = (label: string): IRef => {
    const ctx = Context.get()
    const ref = ctx.makeRef(label)
    return ref
}


////////////////////////////////////

// Claim (you) blahblahblah
// Claim (you) is geomap of bbox ({left=-122.527, bottom=37.664, right=-122.348, top=37.851})

const ctx = Context.get()
const you = Ref("you")

claim(you, ["blahblahblah"])
claim(you, is(geomap({ bbox: { left: -122.527, bottom: 37.664, right: -122.348, top: 37.851 } })))

console.log(ctx.dump())
console.log('-------------')


// When /page/ blahblahblah:
// When /map/ is geomap of box /bbox/:
// When /map/ is geomap of bbox /bbox/, /map/ has width /width/, /map/ has height /height/:
// When /someone/ wishes /page/ shows tilelayer /url_template/ with options /opts/, /page/ wishes /target/ shows tilelayer /something/ with options /something/, page ~= target:
// When /someone/ wishes /map/ shows tilelayer /url_template/ with options /opts/, /map/ is geomap of bbox /bbox/, /map/ has width /width/, /map/ has height /height/:
// When tile URL (url) is downloaded to path (path):
// When (you) points "up" at /map/:

when("page", "blahblahblah")
    .then(({ page }) => {
        console.log('then1')
    })
// when(Ref("map"), is({
//     geomap: {
//         bbox: Ref("bbox")
//     }
// }))
//     .and(Ref("map"), has("width", Ref("width")))
//     .and(Ref("map"), has("height", Ref("height")))
//     .then(({ bbox, height, width }) => {
//         console.log('then2')
//     })

// when(Ref("someone"), wishes(Ref("page"), showsTilelayer( 
//     {
//         url: Ref("url_template"),
//         options: Ref("options")
//     }
// ))
// )
//     .and("page", wishes(Ref("target"), showsTilelayer(
//         {
//             url: Ref("something"),
//             options: Ref("someOptions")
//         }
//     )))
//     .and(Ref("page"), matches(Ref("target")))
//     .then(() => {
//         console.log('then3')
//     })

// when(Ref("someone"), wishes(Ref("map"), showsTilelayer(
//     {
//         url: Ref("url_template"),
//         options: Ref("opts")
//     }
// )))
//     .and(Ref("map"), is({
//         geomap: {
//             bbox: Ref("bbox")
//         }
//     }))
//     .and(Ref("map"), has("width", Ref("width")))
//     .and(Ref("map"), has("height", Ref("height")))
//     .then(({ bbox, height, width }) => {
//         console.log('then4')
//     })


// Wish (page) is highlighted "blue".
// Wish (map) has illumination (ill).
// Wish (map) shows tilelayer "http://demographics.virginia.edu/DotMap/tiles4/%d/%d/%d.png" with options ({max_zoom=13}).
// Wish (target) shows tilelayer (url_template) with options (opts).

const page = Ref("page")
wish(page, highlighted("blue"))
const map = Ref("map")
const ill = Ref("ill")
wish(map, hasIllumination(ill))
wish(map, showsTilelayer(
    {
        url: "http://demographics.virginia.edu/DotMap/tiles4/%d/%d/%d.png",
        options: { max_zoom: 13 }
    }
))
const target = Ref("target")
const url_template = Ref("url_template")
const opts = Ref("opts")
wish(target, showsTilelayer({
    url: url_template,
    options: opts
}))

console.log(ctx.dump())
console.log('-------------')

////////////////