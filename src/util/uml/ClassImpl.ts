
interface Element {
    getOwner(): Promise<Element | null>;
    getOwnedElements(): Promise<Element[]>;
}

interface UMLType extends NamedElement {
    getPackage(): Promise<UMLPackage>;
}

interface UMLPackage extends NamedElement {
    getOwnedTypes(): Promise<UMLType[]>;
}

interface NamedElement extends Element {
    getName(): Promise<string>;
    setName(value: string): void;
}

interface Property extends NamedElement {
    getType(): Promise<UMLType>;

}

interface Operation extends NamedElement {
    getReturnType(): Promise<UMLType>;
}



interface UMLClass extends UMLType {
    isAbstract(): Promise<boolean>;
    setAbstract(value: boolean): Promise<void>;
    getOwnedAttributes(): Promise<Property[]>;
    getOwnedOperations(): Promise<Operation[]>;
    isActive(): Promise<boolean>;
    setActive(value: boolean): Promise<void>;
}

export async function getClassImpl(lib: any): Promise<UMLClass> { // lib is passed so that loaded libraries can be interchangable based upon what is passed inside of App.tsx.
    const ClassImpl = await lib.org.eclipse.uml2.uml.internal.impl.ClassImpl 
    const C1: UMLClass = await new ClassImpl();
    await C1.setName("ClassImpl");
    return C1;
}