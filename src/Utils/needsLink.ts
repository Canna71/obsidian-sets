import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { IntrinsicAttributeKey } from "src/Views/components/SetDefinition";

const needsLink = (attributes : AttributeDefinition[] ) => {
    // we need a link to the note if the props.attributes
    // do not contain the FileName attribute
    return !attributes.find(at => at.key === IntrinsicAttributeKey.FileName);
}

export default needsLink;
