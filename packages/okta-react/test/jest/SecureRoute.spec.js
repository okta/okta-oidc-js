import { SecureRoute, RenderWrapper } from "../../src/SecureRoute";
import { MemoryRouter, Route } from "react-router-dom";

describe('SecureRoute', () => {
  const TestComponent = () => <div>Test Component</div>;
  const mockProps = {
    auth: {
      isAuthenticated: () => Promise.resolve(true).catch(err => err),
      login: () => Promise.resolve(true).catch(err => err),
    }
  };
  it('should accept exact prop and pass it to the internal Route component', () => {
    const wrapper = mount(
      <MemoryRouter
        initialEntries={['/']}
        initialIndex={0}
      >
        <SecureRoute
          exact={true}
          path="/"
          component={TestComponent}
          {...mockProps}
        />
      </MemoryRouter>
    );
    expect(wrapper.find(Route).props().exact).toBe(true);
  });
});
