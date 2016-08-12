import React, { Component } from 'react';
import LinkTo from './../Shared/LinkTo';
import { Accordion, AccordionItem } from 'react-sanfona';

import AccordionStyles from '../../../styles/components/FAQ/c-accordion.scss';

class FAQAccordion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };

    this.toggleItemBinded = this.toggleItem.bind(this);
  }

  getAccordionItems() {
    const entries = this.props.entries;
    const accordionItems = [];
    const direction = this.state.isOpen ? '-down' : '-left';

    for (let index = 0; index < entries.length; index++) {

      accordionItems.push(
        <AccordionItem
          key={index}
          title={entries[index].question}
          className={AccordionStyles['accordion-item']}
          titleClassName={AccordionStyles['item-title']}
        >
          <article className={AccordionStyles['item-answer']}>
            <p
              dangerouslySetInnerHTML={{
                __html: entries[index].answer
              }}
            />
          </article>
        </AccordionItem>
      );
    }

    return accordionItems;
  }

  toggleItem() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <Accordion
        allowMultiple={false}
        activeItems={[-1]}
        className={AccordionStyles['c-accordion']}
        onChange={this.toggleItemBinded}
      >
        {this.getAccordionItems()}
      </Accordion>
    );
  }
}

FAQAccordion.propTypes = {
  entries: React.PropTypes.array
};

export default FAQAccordion;
